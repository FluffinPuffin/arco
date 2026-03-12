# arco
Project for DIG capstone.
PLEASE PULL HERE. Never to main
Use frame branch for the frame of all html

## How to Run

**Requirements:** Docker Desktop must be installed and running.

1. Clone the repo
2. Open a terminal in the project folder
3. Run:
```
docker compose up --build
```
4. Open your browser and go to:
```
http://localhost:8080
```

To stop the project:
```
docker compose down
```

## Test Accounts

| Account | Email | Password |
|---|---|---|
| Basic (no premium) | test.basic@arco.com | Password1234% |
| Premium | test.premium@arco.com | Password1234% |
| QR access only | test.qr@arco.com | Password1234% |
| Premium + QR | test.both@arco.com | Password1234% |

## You need the .env file. 
Place it in the SAME directory with this README.md and docker-compose.yaml
