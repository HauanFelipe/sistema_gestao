Deploy interno - Stage Sistemas

1) Entre na pasta deploy\backend
2) Instale dependencias: npm install
3) Configure .env (DATABASE_URL)
4) Rode: npx prisma db push && npx prisma generate && npx prisma db seed
5) Inicie: npm run start:prod

Frontend ja esta em deploy\backend\public
