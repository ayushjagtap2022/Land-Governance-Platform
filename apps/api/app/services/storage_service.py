import os
import shutil
import logging
from pathlib import Path
from typing import Optional, Tuple
from app.core.config import settings

logger = logging.getLogger("storage_service")

# Initialize Boto3 S3 client if credentials exist
s3_client = None
if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
    try:
        import boto3
        s3_client = boto3.client(
            "s3",
            endpoint_url=settings.AWS_ENDPOINT_URL or None,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        logger.info("AWS S3 client initialized successfully.")
    except Exception as e:
        logger.warning(f"Failed to initialize AWS S3 client: {e}")

class StorageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_bytes: bytes, filename: str) -> Tuple[str, str]:
        """
        Saves file to AWS S3 if configured, or falls back to local disk storage.
        Returns (storage_path_or_url, storage_type)
        """
        safe_name = filename.replace(" ", "_")
        
        # 1. Try S3 upload
        if s3_client and settings.AWS_S3_BUCKET:
            try:
                s3_key = f"documents/{safe_name}"
                s3_client.put_object(
                    Bucket=settings.AWS_S3_BUCKET,
                    Key=s3_key,
                    Body=file_bytes
                )
                s3_url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
                logger.info(f"File uploaded to AWS S3: {s3_url}")
                return s3_url, "s3"
            except Exception as e:
                logger.error(f"S3 upload failed: {e}. Falling back to local storage.")

        # 2. Local disk fallback
        local_path = self.upload_dir / safe_name
        with open(local_path, "wb") as f:
            f.write(file_bytes)
        logger.info(f"File stored locally: {local_path}")
        return str(local_path), "local"

    def get_presigned_download_url(self, s3_key: str, expires_in: int = 3600) -> Optional[str]:
        if s3_client and settings.AWS_S3_BUCKET:
            try:
                return s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.AWS_S3_BUCKET, "Key": s3_key},
                    ExpiresIn=expires_in
                )
            except Exception as e:
                logger.error(f"Error generating presigned URL: {e}")
        return None

storage_service = StorageService()
