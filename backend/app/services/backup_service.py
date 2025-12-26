"""
Backup Service
Manages backups and restore operations
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.models.backup import Backup, RestoreOperation, BackupType, BackupStatus
from app.core.logging import logger


class BackupService:
    """Service for backup operations"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_backup(
        self,
        name: str,
        backup_type: BackupType,
        description: Optional[str] = None,
        is_automatic: bool = False,
        retention_days: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None
    ) -> Backup:
        """Create a new backup record"""
        expires_at = None
        if retention_days:
            expires_at = datetime.utcnow() + timedelta(days=retention_days)
        
        backup = Backup(
            name=name,
            description=description,
            backup_type=backup_type,
            is_automatic=is_automatic,
            expires_at=expires_at,
            backup_metadata=json.dumps(metadata) if metadata else None,
            user_id=user_id,
            status=BackupStatus.PENDING
        )
        
        self.db.add(backup)
        await self.db.commit()
        await self.db.refresh(backup)
        
        return backup

    async def get_backup(self, backup_id: int) -> Optional[Backup]:
        """Get a backup by ID"""
        return await self.db.get(Backup, backup_id)

    async def get_backups(
        self,
        backup_type: Optional[BackupType] = None,
        status: Optional[BackupStatus] = None,
        user_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Backup]:
        """Get backups with filters"""
        query = select(Backup)
        
        if backup_type:
            query = query.where(Backup.backup_type == backup_type)
        
        if status:
            query = query.where(Backup.status == status)
        
        if user_id:
            query = query.where(Backup.user_id == user_id)
        
        result = await self.db.execute(
            query.order_by(desc(Backup.created_at))
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def update_backup_status(
        self,
        backup_id: int,
        status: BackupStatus,
        file_path: Optional[str] = None,
        file_size: Optional[int] = None,
        checksum: Optional[str] = None,
        error_message: Optional[str] = None
    ) -> Optional[Backup]:
        """Update backup status"""
        backup = await self.get_backup(backup_id)
        if not backup:
            return None
        
        backup.status = status
        
        if status == BackupStatus.IN_PROGRESS:
            backup.started_at = datetime.utcnow()
        elif status in [BackupStatus.COMPLETED, BackupStatus.FAILED]:
            backup.completed_at = datetime.utcnow()
            if file_path:
                backup.file_path = file_path
            if file_size:
                backup.file_size = file_size
            if checksum:
                backup.checksum = checksum
            if error_message:
                backup.error_message = error_message
        
        await self.db.commit()
        await self.db.refresh(backup)
        
        return backup

    async def create_restore_operation(
        self,
        backup_id: int,
        user_id: Optional[int] = None
    ) -> RestoreOperation:
        """Create a restore operation"""
        restore = RestoreOperation(
            backup_id=backup_id,
            user_id=user_id,
            status=BackupStatus.PENDING,
            started_at=datetime.utcnow()
        )
        
        self.db.add(restore)
        await self.db.commit()
        await self.db.refresh(restore)
        
        return restore

    async def update_restore_status(
        self,
        restore_id: int,
        status: BackupStatus,
        error_message: Optional[str] = None
    ) -> Optional[RestoreOperation]:
        """Update restore operation status"""
        restore = await self.db.get(RestoreOperation, restore_id)
        if not restore:
            return None
        
        restore.status = status
        
        if status in [BackupStatus.COMPLETED, BackupStatus.FAILED]:
            restore.completed_at = datetime.utcnow()
            if error_message:
                restore.error_message = error_message
        
        await self.db.commit()
        await self.db.refresh(restore)
        
        return restore

    async def delete_backup(self, backup_id: int) -> bool:
        """Delete a backup"""
        backup = await self.get_backup(backup_id)
        if not backup:
            return False
        
        # TODO: Delete actual backup file from storage
        
        await self.db.delete(backup)
        await self.db.commit()
        
        return True

    async def get_expired_backups(self) -> List[Backup]:
        """Get expired backups that should be cleaned up"""
        now = datetime.utcnow()
        result = await self.db.execute(
            select(Backup).where(
                and_(
                    Backup.expires_at != None,
                    Backup.expires_at <= now,
                    Backup.status != BackupStatus.EXPIRED
                )
            )
        )
        return list(result.scalars().all())

    async def mark_expired(self, backup_id: int) -> Optional[Backup]:
        """Mark a backup as expired"""
        backup = await self.get_backup(backup_id)
        if not backup:
            return None
        
        backup.status = BackupStatus.EXPIRED
        await self.db.commit()
        await self.db.refresh(backup)
        
        return backup

