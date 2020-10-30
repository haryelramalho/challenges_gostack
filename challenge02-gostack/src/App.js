import React, { useState, useEffect } from "react";

import api from './services/api';
import "./styles.css";

function App() {
  const [ repositories, setRepositories ] = useState([]); //Criando variável de estado

  useEffect(() => { //faz a chamada da API e como resposta obtém todos os repositórios que já existem
    api.get('repositories').then(response => {
      setRepositories(response.data); 
    })
  }, []); //Faz sentido utilizar sem uma variável por que só preciso saber dos repositórios que tem no banco de dados apenas uma vez na aplicação

  async function handleAddRepository() {
    const response = await api.post('repositories', {
      title: 'challenge 02 go stack',
      url: 'https://github.com/haryelramalho/challenge02-gostack',
      techs: ['NodeJs', 'Ruby', 'Python'],
    });

    const repository = response.data;

    setRepositories([...repositories, repository]);
  }

  async function handleRemoveRepository(id) {
    await api.delete(`repositories/${id}`);

    const newRepositories = repositories.filter(repository => repository.id !== id); //O filter não altera o array, ele retorna um novo array filtrado
  
    setRepositories(newRepositories);
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {repositories.map(repository => 
          (
            <li key={repository.id}>
              {repository.title}
              <button onClick={() => handleRemoveRepository(repository.id)}>
                Remover
              </button>
            </li>
          )
        )}
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
