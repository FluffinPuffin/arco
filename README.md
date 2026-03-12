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

All accounts use password: `Password1234%`

| Account | Email | Grade | Premium | QR Access |
|---|---|---|---|---|
| Basic | test.basic@arco.com | Grade 1 | No | No |
| Premium only | test.premium@arco.com | Grade 1 | Yes | No |
| QR access only | test.qr@arco.com | Grade 1 | No | Yes |
| Premium + QR | test.both@arco.com | Grade 1 | Yes | Yes |
| Grade 2 | test.grade2@arco.com | Grade 2 | No | No |
| Grade 3 (premium) | test.grade3@arco.com | Grade 3 | Yes | No |
| Grade 4 (QR) | test.grade4@arco.com | Grade 4 | No | Yes |
| Grade 5 (premium + QR) | test.grade5@arco.com | Grade 5 | Yes | Yes |
| Grade 6 | test.grade6@arco.com | Grade 6 | No | No |
| Expired premium | test.expired@arco.com | Grade 1 | Expired | No |
| Child lock (PIN: 1234) | test.childlock@arco.com | Grade 2 | No | No |
| No display name | test.nodisplay@arco.com | Grade 1 | No | No |

## You need in the .env file.
Place it in the directory

## Admin Panel
http://localhost:8080/Admin/html/index.html
