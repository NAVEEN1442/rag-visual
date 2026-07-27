import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint, text, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from db.session import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True)
    email = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    configs = relationship("PipelineConfig", back_populates="user", cascade="all, delete-orphan")
    runs = relationship("Run", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = 'documents'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    filename = Column(String, nullable=False)
    cloudinary_url = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    status = Column(String, nullable=False, default='uploaded', server_default='uploaded')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="documents")
    runs = relationship("Run", back_populates="document")


class PipelineConfig(Base):
    __tablename__ = 'pipeline_configs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    name = Column(String, nullable=False)
    parser_strategy = Column(String, nullable=False)
    chunker_strategy = Column(String, nullable=False)
    chunker_params = Column(JSONB, nullable=False, server_default='{}')
    embedder_strategy = Column(String, nullable=False)
    retriever_top_k = Column(Integer, nullable=False, default=5, server_default='5')
    reranker_strategy = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="configs")
    runs = relationship("Run", back_populates="config")


class Run(Base):
    __tablename__ = 'runs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    config_id = Column(UUID(as_uuid=True), ForeignKey("pipeline_configs.id"), nullable=True)
    query = Column(String, nullable=False)
    status = Column(String, nullable=False, default='pending', server_default='pending')
    total_latency_ms = Column(Integer, nullable=True)
    total_tokens = Column(Integer, nullable=True)
    total_cost_usd = Column(Numeric(10, 6), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="runs")
    document = relationship("Document", back_populates="runs")
    config = relationship("PipelineConfig", back_populates="runs")
    stage_events = relationship("StageEvent", back_populates="run", cascade="all, delete-orphan")


class StageEvent(Base):
    __tablename__ = 'stage_events'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    run_id = Column(UUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"), nullable=True)
    stage_name = Column(String, nullable=False)
    sequence = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default='running', server_default='running')
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_ms = Column(Integer, nullable=True)
    input_snapshot = Column(JSONB, nullable=True)
    output_snapshot = Column(JSONB, nullable=True)
    event_metadata = Column("metadata", JSONB, nullable=True) 

    run = relationship("Run", back_populates="stage_events")

    __table_args__ = (
        UniqueConstraint('run_id', 'sequence', name='uq_stage_events_run_id_sequence'),
    )
