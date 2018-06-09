import app from './app';

const port = process.env.BUDGET_PORT || process.env.PORT || 3000;
const host = process.env.BUDGET_HOST || process.env.HOST || '0.0.0.0';

app.listen(port, host, (err) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`server is listening on ${host}:${port}`);
});
