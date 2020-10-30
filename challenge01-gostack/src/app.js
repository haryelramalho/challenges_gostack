const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

const repositories = [];

app.use(express.json());
app.use(cors());

function findRepository(id) {
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  const repository = repositories[repositoryIndex];

  return [repository, repositoryIndex];
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({ message: 'Invalid Id' })
  }

  [request.repository, request.repository.index] = findRepository(id);

  return next();
}

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const id = uuid();

  const likes = 0;

  const repository = {
    id,
    title, 
    url, 
    techs,
    likes
  }

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", validateRepositoryId,(request, response) => {
  const data = request.body;

  const repository = request.repository;

  // Se o data. for verdade, ele já retorna
  const updatedRepository = {
    id: repository.id,
    title: data.title || repository.title,
    url: data.url || repository.url,
    techs: data.techs || repository.techs,
    likes: repository.likes
  }

  repositories[repository.index] = updatedRepository;

  return response.status(201).json(updatedRepository);
});

app.delete("/repositories/:id", validateRepositoryId,(request, response) => {
  const repositoryIndex = repositories.findIndex(repository => repository.id === request.id);

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", validateRepositoryId,(request, response) => {
  const repository = request.repository;
  
  repository.likes += 1;

  return response.status(200).json(repository);
});

module.exports = app;
