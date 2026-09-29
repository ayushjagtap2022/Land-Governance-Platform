import os
import uuid
import boto3
from fastapi import UploadFile

from dotenv import load_dotenv

load_dotenv(override=True)

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv("S3_ENDPOINT_URL"),
        aws_access_key_id=os.getenv("S3_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("S3_SECRET_KEY"),
        region_name=os.getenv("S3_REGION", "us-east-1")
    )

def upload_proposal_pdf(file: UploadFile) -> str:
    """
    Uploads a PDF to S3/B2 and returns the public URL.
    """
    file_ext = file.filename.split(".")[-1]
    object_name = f"proposals/{uuid.uuid4()}.{file_ext}"
    
    try:
        # We read the file into memory (good enough for 10MB PDFs)
        file_bytes = file.file.read()
        
        client = get_s3_client()
        bucket = os.getenv("S3_BUCKET_NAME", "proposals-bucket")
        
        client.put_object(
            Bucket=bucket,
            Key=object_name,
            Body=file_bytes,
            ContentType=file.content_type
        )
        
        # Build the public URL depending on the provider
        endpoint = os.getenv("S3_ENDPOINT_URL", "https://s3.amazonaws.com")
        
        # For Supabase/B2 style path endpoints:
        public_url = f"{endpoint}/{bucket}/{object_name}"
        return public_url
        
    except Exception as e:
        raise Exception(f"Failed to upload to S3: {str(e)}")
