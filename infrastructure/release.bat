CALL cd ..
CALL heroku container:login
CALL heroku container:push web --app=covid19liveupdbot
CALL heroku container:release web --app=covid19liveupdbot
CALL heroku open --app=covid19liveupdbot