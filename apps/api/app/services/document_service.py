import uuid
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from app.models.document import Document, DocumentCreate

async def create_document(db: AsyncSession, document_in: DocumentCreate) -> Document:
    """
    Business logic and database operations combined in the service layer.
    """
    # Create the database model
    db_document = Document.model_validate(document_in)
    
    # You could add complex logic here (e.g., calling an ML model for embedding,
    # firing off a notification, etc.) before saving to the DB.
    
    db.add(db_document)
    await db.commit()
    await db.refresh(db_document)
    return db_document

async def get_all_documents(db: AsyncSession) -> list[Document]:
    result = await db.execute(select(Document))
    return result.scalars().all()
