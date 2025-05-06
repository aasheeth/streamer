import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker
from faker import Faker

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "streamer")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class DummyData(Base):
    __tablename__ = "dummy_data"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    age = Column(Integer, nullable=False)

Base.metadata.create_all(bind=engine)

fake = Faker()
session = SessionLocal()

total_rows = 50000
batch_size = 1000

print(f"Inserting {total_rows} rows into 'dummy_data'...")

for i in range(0, total_rows, batch_size):
    batch = [
        DummyData(name=fake.name(), email=fake.email(), age=fake.random_int(min=18, max=70))
        for _ in range(batch_size)
    ]
    session.bulk_save_objects(batch)
    session.commit()
    print(f"Inserted {i + batch_size} rows...")

session.close()
print("✅ Data seeding complete.")
