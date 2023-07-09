const express = require('express')
const app = express()
const cors = require('cors')

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: true }));

const getId = () => Math.random().toString(16).slice(2);
const users = [];
const exercises = [];

// Add user with form data
app.post("/api/users", (req, res) => {
  const username = req?.body?.username;

  const user = {
    username: username ?? "Undefined get",
    _id: getId() + getId()
  };

  users.push(user);  
  res.json(user);
});

// Get all users in an array
app.get("/api/users", (req, res) => {
  res.json(users);
})

// Add exercise to user by their id
app.post("/api/users/:_id/exercises", (req, res) => {
  const { description, duration, date } = req.body;
  const { _id } = req.params;
  const user = users.filter((user) => user._id === _id)[0];
  
  const exercise = {
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
    duration: Number(duration),
    description,
    _id
  }

  exercises.push(exercise);
  res.json({ _id: user._id, username: user.username, ...exercise });
})

// Get all information associated with a user and exercises filter by date with a limit
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const user = users.filter((user) => user._id === _id)[0];
  const { from, to, limit } = req.query;
  
  const userExercises = exercises
    .filter(exercise => {
      return exercise._id === _id
        && (!from || new Date(exercise.date).getTime() > new Date(from).getTime())
        && (!to || new Date(exercise.date).getTime() < new Date(to).getTime());
    })
    .map(({ description, duration, date }) => {
      return { description, duration, date }
    })
    .slice(0, limit);
  
  res.json({
    ...user,
    count: userExercises.length,
    log: userExercises
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
