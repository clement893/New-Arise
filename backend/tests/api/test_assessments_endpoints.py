"""
API endpoint tests for assessments
"""

import pytest
from httpx import AsyncClient
from datetime import datetime
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentType, AssessmentStatus
from app.models.user import User
from app.core.security import create_access_token


@pytest.fixture
async def auth_headers(test_user: User) -> dict:
    """Create auth headers for test user"""
    token = create_access_token({"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def db_session(db):
    """Alias for db fixture for clarity"""
    return db


@pytest.mark.api
class TestAssessmentsEndpoint:
    """Test assessment API endpoints"""

    @pytest.mark.asyncio
    async def test_start_assessment_tki(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Test starting a TKI assessment"""
        response = await client.post(
            "/api/v1/assessments/start",
            json={"type": "tki"},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "tki"
        assert data["status"] == "not_started"
        assert "id" in data
        assert "created_at" in data
        assert data["message"] == "Assessment started successfully"

    @pytest.mark.asyncio
    async def test_start_assessment_wellness(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Test starting a Wellness assessment"""
        response = await client.post(
            "/api/v1/assessments/start",
            json={"type": "wellness"},
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "wellness"
        assert data["status"] == "not_started"

    @pytest.mark.asyncio
    async def test_start_assessment_invalid_type(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Test starting an assessment with invalid type"""
        response = await client.post(
            "/api/v1/assessments/start",
            json={"type": "invalid_type"},
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "Invalid assessment type" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_start_assessment_unauthorized(
        self,
        client: AsyncClient,
    ):
        """Test starting an assessment without authentication"""
        response = await client.post(
            "/api/v1/assessments/start",
            json={"type": "tki"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_save_response(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session,
    ):
        """Test saving a response to an assessment"""
        # Create an assessment first
        assessment = Assessment(
            user_id=test_user.id,
            assessment_type=AssessmentType.TKI,
            status=AssessmentStatus.NOT_STARTED,
        )
        db_session.add(assessment)
        await db_session.commit()
        await db_session.refresh(assessment)

        response = await client.post(
            f"/api/v1/assessments/{assessment.id}/responses",
            json={
                "question_id": "q1",
                "response_data": {"selected_mode": "competing"},
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Response saved successfully"
        assert data["question_id"] == "q1"

    @pytest.mark.asyncio
    async def test_save_response_assessment_not_found(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Test saving a response to a non-existent assessment"""
        response = await client.post(
            "/api/v1/assessments/99999/responses",
            json={
                "question_id": "q1",
                "response_data": {"selected_mode": "competing"},
            },
            headers=auth_headers,
        )

        assert response.status_code == 404
        assert "Assessment not found" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_save_response_completed_assessment(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session,
    ):
        """Test saving a response to a completed assessment"""
        # Create a completed assessment
        assessment = Assessment(
            user_id=test_user.id,
            assessment_type=AssessmentType.TKI,
            status=AssessmentStatus.COMPLETED,
        )
        db_session.add(assessment)
        await db_session.commit()
        await db_session.refresh(assessment)

        response = await client.post(
            f"/api/v1/assessments/{assessment.id}/responses",
            json={
                "question_id": "q1",
                "response_data": {"selected_mode": "competing"},
            },
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "Cannot modify a completed assessment" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_assessment(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session,
    ):
        """Test getting assessment details"""
        # Create an assessment with some responses
        assessment = Assessment(
            user_id=test_user.id,
            assessment_type=AssessmentType.TKI,
            status=AssessmentStatus.IN_PROGRESS,
            started_at=datetime.utcnow(),
        )
        db_session.add(assessment)
        await db_session.commit()
        await db_session.refresh(assessment)

        # Add some responses
        for i in range(5):
            answer = AssessmentAnswer(
                assessment_id=assessment.id,
                question_id=f"q{i+1}",
                answer_value='{"selected_mode": "competing"}',
            )
            db_session.add(answer)
        await db_session.commit()

        response = await client.get(
            f"/api/v1/assessments/{assessment.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == assessment.id
        assert data["type"] == "tki"
        assert data["status"] == "in_progress"
        assert "progress" in data
        assert data["progress"]["answered"] == 5
        assert data["progress"]["total"] == 30

    @pytest.mark.asyncio
    async def test_get_user_assessments(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session,
    ):
        """Test getting all user assessments"""
        # Create multiple assessments
        for assessment_type in [AssessmentType.TKI, AssessmentType.WELLNESS]:
            assessment = Assessment(
                user_id=test_user.id,
                assessment_type=assessment_type,
                status=AssessmentStatus.COMPLETED,
            )
            db_session.add(assessment)
        await db_session.commit()

        response = await client.get(
            "/api/v1/assessments/user/assessments",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    @pytest.mark.asyncio
    async def test_get_user_assessments_filter_by_type(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session,
    ):
        """Test filtering user assessments by type"""
        # Create assessments of different types
        for assessment_type in [AssessmentType.TKI, AssessmentType.WELLNESS]:
            assessment = Assessment(
                user_id=test_user.id,
                assessment_type=assessment_type,
                status=AssessmentStatus.COMPLETED,
            )
            db_session.add(assessment)
        await db_session.commit()

        response = await client.get(
            "/api/v1/assessments/user/assessments?type=tki",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert all(a["type"] == "tki" for a in data)

    @pytest.mark.asyncio
    async def test_delete_assessment(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session,
    ):
        """Test deleting an assessment"""
        # Create an assessment
        assessment = Assessment(
            user_id=test_user.id,
            assessment_type=AssessmentType.TKI,
            status=AssessmentStatus.NOT_STARTED,
        )
        db_session.add(assessment)
        await db_session.commit()
        await db_session.refresh(assessment)

        response = await client.delete(
            f"/api/v1/assessments/{assessment.id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Assessment deleted successfully"
        assert data["assessment_id"] == assessment.id

    @pytest.mark.asyncio
    async def test_delete_assessment_not_found(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
    ):
        """Test deleting a non-existent assessment"""
        response = await client.delete(
            "/api/v1/assessments/99999",
            headers=auth_headers,
        )

        assert response.status_code == 404
        assert "Assessment not found" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_assessment_results_not_completed(
        self,
        client: AsyncClient,
        test_user: User,
        auth_headers: dict,
        db_session,
    ):
        """Test getting results for an incomplete assessment"""
        # Create an incomplete assessment
        assessment = Assessment(
            user_id=test_user.id,
            assessment_type=AssessmentType.TKI,
            status=AssessmentStatus.IN_PROGRESS,
        )
        db_session.add(assessment)
        await db_session.commit()
        await db_session.refresh(assessment)

        response = await client.get(
            f"/api/v1/assessments/{assessment.id}/results",
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "not completed yet" in response.json()["detail"].lower()
