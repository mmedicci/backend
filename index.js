const express = require('express');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const { MongoClient, ObjectId} = require ('mongodb');

(async () => {


const connectionString = 'mongodb+srv://mmedicci:d0RfWUjudHvCx6LO@cluster0.ayqus8t.mongodb.net/Voluntarios_RS?retryWrites=true&w=majority&appName=CLUSTER0'

console.info('conectando ao banco de dados MongoDB');

const options = {
    

};

/*const client =  await mongodb.MongoClient.connect(connectionString, options);*/

const client = new MongoClient(connectionString);

await client.connect();

const app = express();

const port = 3000;

app.use(bodyParser.json());


/* endpoints CRUD

- [GET] /cadastros = retorno lista de cadastrados
- [GET] /Cadastros/{id} = retorna apenas um unico cadastro
- [POST] /cadastros = cria novos cadastros
- [PUT] /cadastros/{id} = atualiza um cadastro pelo ID
- [DELETE] /cadastros/{id} = remover um cadastro pelo ID

*/

const db = client.db('Voluntarios_RS');
const cadastros = db.collection('Cadastros');


const getCadastrosValidos = () => cadastros.find({}).toArray();

const getCadastroById = async id => await cadastros.findOne({ _id: new ObjectId(id) });


//  [GET] /cadastros = retorno lista de cadastrados //

app.get('/cadastros', async (req, res) => {
  res.send(await getCadastrosValidos()); //apaga o null

});

// [GET] /Cadastro/{id} = retorna apenas um unico cadastro 

app.get('/cadastros/:id', async (req, res) => {
  const id = req.params.id;

  const cadastro = await getCadastroById(id);

  if (!cadastro) {
    res.send("Cadastro não encontrado");

    return;
  }

  res.send(cadastro);
});

// [POST] /cadastros = cria novos cadastros

app.post('/cadastros', async (req, res) => {
  const cadastro = req.body;

  //para validar se o cadastro existe

  if (!cadastro 
    || !cadastro.nome
    || !cadastro.cpf
    || !cadastro.nascimento
    || !cadastro.telefone
    || !cadastro.email
    || !cadastro.tipovol
    || !cadastro.uf 
    || !cadastro.disponivel
    || !cadastro.observaçao
  
  ) {
    res.send('Cadastro inválido');

    return;

  }
  
  const { insertedCount } = await cadastros.insertOne(cadastro);

  if (insertedCount !== 1) {
    res.send('Cadastro realizado');

    return;
  }

  res.send(cadastro);

});

//[PUT] /cadastros/{id} = atualiza um cadastro pelo ID

app.put('/cadastros/:id', async (req, res) => {
  const id = req.params.id;

  const NovoCadastro = req.body;

  if (!NovoCadastro 
    || !NovoCadastro.nome
    || !NovoCadastro.cpf
    || !NovoCadastro.nascimento
    || !NovoCadastro.telefone
    || !NovoCadastro.email
    || !NovoCadastro.tipovol
    || !NovoCadastro.uf 
    || !NovoCadastro.disponivel
    || !NovoCadastro.observaçao
  ) {

      res.send('Cadastro inválido');

      return;
    }
  
  const quantidade_cadastros = await cadastros.countDocuments({ _id: new ObjectId(id) });
  
  if (quantidade_cadastros !== 1) {
    res.send('Cadastro não encontrado');

    return;
  }

  const { result } = await cadastros.updateOne (
    {
      _id: new ObjectId(id)
    },
    {
      $set: NovoCadastro

    }

  );

  if (result !== 1) {
    res.send('Cadastro atualizado com sucesso');

    return;
  }

  res.send(await getCadastroById(id));
});

//[DELETE] /cadastros/{id} = remover um cadastro pelo ID

app.delete('/cadastros/:id', async (req, res) => {
  const id = req.params.id;

  const quantidade_cadastros = await cadastros.countDocuments({ _id: new ObjectId(id) });

    if (quantidade_cadastros !== 1) {
        res.send('Cadastro não encontrado');

        return;
    }


    const { deletedCount } = await cadastros.deleteOne({ _id: new ObjectId(id) });

    if (deletedCount !== 1) {
        res.send('Ocorreu um erro ao remover o cadastro');

        return;
    }

    res.send('Cadastro removido com sucesso.');
});

app.listen(port, () => {
    console.info(`App rodando em http://localhost:${port}` );
})

})();

