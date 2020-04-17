CALL cd ..
CALL heroku container:login
CALL heroku container:push web --app=%1
CALL heroku container:release web --app=%1
CALL heroku open --app=%1
