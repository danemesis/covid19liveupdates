CALL cd ..
CALL heroku container:login
CALL heroku container:push demo --app=demo-covid19livebot
CALL heroku container:release demo --app=demo-covid19livebot
CALL heroku open --app=demo-covid19livebot
