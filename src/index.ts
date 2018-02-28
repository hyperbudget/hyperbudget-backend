import app from './app';

const port = process.env.BUDGET_PORT || 3000;
const host = process.env.BUDGET_HOST || 'localhost';

app.listen(port, host, (err) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${host}:${port}`);
});
