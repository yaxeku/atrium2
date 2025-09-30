@ECHO OFF
SET PGPASSWORD=xekupanel
"C:\Program Files\PostgreSQL\16\bin\dropdb.exe" -U postgres -h localhost xekupanel
"C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres -h localhost xekupanel
"C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -d xekupanel -f database.sql
PAUSE
