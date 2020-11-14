import Amplify from "aws-amplify";
import React from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";

import "./App.css";
import config from "./aws-exports";

import * as todoService from "./service/todo";

const initialTodoData = { name: "", description: "" };

Amplify.configure(config);

class Todo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      todos: [],
      formData: initialTodoData,
      image: null,
    };
  }

  componentDidMount() {
    this.fetchTodos();
  }

  setTodos = (v) => {
    this.setState({
      todos: v,
    });
  };

  setFormData = (v) => {
    this.setState({
      formData: v,
    });
  };

  onImageUpload = async (e) => {
    if (!e.target.files[0]) return;
    const file = e.target.files[0];
    const fileUploadRes = await todoService.upload(file);
    console.log(fileUploadRes);
    this.setFormData({ ...this.state.formData, image: file.name });
    await todoService.fetchTodos();
  };

  fetchTodos = async () => {
    const todos = await todoService.fetchTodos();
    this.setTodos(todos);
  };

  createTodo = async () => {
    console.log(this.state.formData);
    const { formData, todos } = this.state;

    if (!formData.name || !formData.description) return;
    try {
      await todoService.createTodo(formData);
      if(formData.image) {
        const image = await todoService.fetchImage(formData.image)
        formData.image = image;
      }
      this.setTodos([...todos, formData]);
      this.setFormData(initialTodoData);
    } catch (e) {
      console.error(e);
    }
  };

  deleteTodo = async (id) => {
    const newTodosArray = this.state.todos.filter((todo) => todo.id !== id);
    try {
      this.setTodos(newTodosArray);
      await todoService.deleteTodo(id);
    } catch (e) {
      console.error(e);
    }
  };

  onFormDataChange = (e) => {
    const { name, value } = e.target;
    const { formData } = this.state;
    this.setFormData({ ...formData, [name]: value });
  };

  render() {
    return (
      <TodoUi
        todos={this.state.todos}
        formData={this.state.formData}
        deleteTodo={this.deleteTodo}
        createTodo={this.createTodo}
        setFormData={this.setFormData}
        onFormDataChange={this.onFormDataChange}
        onImageUpload={this.onImageUpload}
      />
    );
  }
}

function TodoUi(props) {
  const {
    todos = [],
    formData = null,
    onFormDataChange = (f) => f,
    createTodo = (f) => f,
    deleteTodo = (f) => f,
    onImageUpload = (f) => f,
  } = props;
  if (!formData) {
    return null;
  }
  return (
    <div className="App">
      <h1>Todo App</h1>
      <input
        name="name"
        placeholder="Todo title"
        value={formData.name}
        onChange={onFormDataChange}
      ></input>

      <input
        name="description"
        placeholder="Todo description"
        value={formData.description}
        onChange={onFormDataChange}
      ></input>
      <input type="file" onChange={onImageUpload} />
      <button onClick={createTodo}>Create Todo</button>
      <div>
        {todos.map((todo, index) => (
          <div key={`${todo.id}-${todo.name}-${index}`}>
            <h2>{todo.name}</h2>
            <p>{todo.description}</p>
            <button onClick={() => deleteTodo(todo.id)}>Delete Todo</button>
            {todo.image && (
              <img
                alt={`${todo.name}`}
                src={todo.image}
                style={{ width: 400 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Todo />
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);
