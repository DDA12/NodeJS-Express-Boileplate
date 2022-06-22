REM --cacert ../../src/config/certificates/ca.cert.pem
curl -k  -X POST -H "Content-Type: application/json" -d @./abPost.json --output nul https://localhost:3000/user/signup
abs -p abPost.json -T application/json -l -n 5000 -c 100 https://localhost:3000/user/login
