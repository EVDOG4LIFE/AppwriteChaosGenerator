import sys
import logging
import random
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from appwrite.client import Client
from appwrite.id import ID
from appwrite.services.databases import Databases
from faker import Faker

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the Faker library
fake = Faker()

response_times = []

def create_user_document(databases, database_id, collection_id):
    """Create a user document with random data."""
    name = fake.name()
    email = fake.email()
    age = random.randint(18, 100)
    document_id = ID.unique()
    try:
        start_time = time.perf_counter()
        response = databases.create_document(
            database_id=database_id,
            collection_id=collection_id,
            document_id=document_id,
            data={
                'Name': name,
                'email': email,
                'age': age
            }
        )
        end_time = time.perf_counter()
        response_time_ms = (end_time - start_time) * 1000
        response_times.append(response_time_ms)
        logging.info(f"Inserted: {response['$id']} - Response Time: {response_time_ms:.2f} ms")
        return response['$id'], email
    except Exception as e:
        logging.error(f"Failed to insert document: {e}")
        return None, None

def verify_document(databases, database_id, collection_id, doc_id, expected_email):
    """Verify a single document."""
    try:
        start_time = time.perf_counter()
        document = databases.get_document(database_id=database_id, collection_id=collection_id, document_id=doc_id)
        end_time = time.perf_counter()
        response_time_ms = (end_time - start_time) * 1000
        response_times.append(response_time_ms)
        if document and 'email' in document and document['email'] == expected_email:
            logging.info(f"Verified document: {doc_id}, email: {document.get('email')} - Response Time: {response_time_ms:.2f} ms")
            return True
        else:
            logging.error(f"Document {doc_id} verification failed: email mismatch or email is null.")
            return False
    except Exception as e:
        logging.error(f"Failed to verify document {doc_id}: {e}")
        return False

def verify_documents(databases, database_id, collection_id, document_ids):
    """Verify multiple documents concurrently."""
    verified_count = 0
    with ThreadPoolExecutor() as executor:
        futures = [executor.submit(verify_document, databases, database_id, collection_id, doc_id, expected_email) for doc_id, expected_email in document_ids]
        for future in as_completed(futures):
            if future.result():
                verified_count += 1
    return verified_count

def seed_users_parallel(databases, database_id, collection_id, count, threading):
    """Seed users concurrently."""
    max_workers = 5 if threading == 'low' else 10 if threading == 'medium' else 20
    document_ids_with_email = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(create_user_document, databases, database_id, collection_id) for _ in range(count)]
        for future in as_completed(futures):
            doc_id, email = future.result()
            if doc_id and email:
                document_ids_with_email.append((doc_id, email))
    logging.info(f"Total documents inserted: {len(document_ids_with_email)}")
    verified_count = verify_documents(databases, database_id, collection_id, document_ids_with_email)
    logging.info(f"Total documents verified: {verified_count}")

    if response_times:
        logging.info(f"Slowest request: {max(response_times):.2f} ms")
        logging.info(f"Fastest request: {min(response_times):.2f} ms")
        logging.info(f"Average request time: {sum(response_times) / len(response_times):.2f} ms")
    else:
        logging.info("No response times recorded.")

if __name__ == '__main__':
    api_endpoint = sys.argv[1]
    project_id = sys.argv[2]
    api_key = sys.argv[3]
    database_id = sys.argv[4]
    collection_id = sys.argv[5]
    record_amount = int(sys.argv[6])
    threading = sys.argv[7]

    client = Client()
    client.set_endpoint(api_endpoint)
    client.set_project(project_id)
    client.set_key(api_key)

    databases = Databases(client)

    seed_users_parallel(databases, database_id, collection_id, record_amount, threading)