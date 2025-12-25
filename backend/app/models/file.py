"""File model."""

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Integer, Index, ForeignKey, func, Boolean
from sqlalchemy.orm import relationship

from app.core.database import Base


class File(Base):
    """File model."""

    __tablename__ = "files"
    __table_args__ = (
        Index("idx_files_user_id", "user_id"),
        Index("idx_files_created_at", "created_at"),
        Index("idx_files_file_key", "file_key", unique=True),
        Index("idx_files_storage_type", "storage_type"),
        Index("idx_files_is_public", "is_public"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)  # Storage path (S3 key or local path)
    file_size = Column(Integer, nullable=False)  # File size in bytes
    mime_type = Column(String(100), nullable=True)
    storage_type = Column(String(50), default='local', nullable=False)  # 'local' or 's3'
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    user = relationship("User", backref="files")

    def __repr__(self) -> str:
        return f"<File(id={self.id}, filename={self.filename}, user_id={self.user_id})>"

