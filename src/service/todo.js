import { API, Storage } from "aws-amplify";
import { listTodos } from "../graphql/queries";
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from "../graphql/mutations";

export async function fetchImage(imageKey) {
  return Storage.get(imageKey);
}

export async function fetchAllImagesOfTodos(todos) {
  return Promise.all(
    todos.map(async (todo) => {
      if (!todo.image) {
        return null;
      }

      return fetchImage(todo.image);
    })
  );
}

export async function fetchTodos() {
  const apiData = await API.graphql({ query: listTodos });
  const todos = apiData.data.listTodos.items;
  const todoImages = await fetchAllImagesOfTodos(todos);

  return todos.map((todo, index) => ({ ...todo, image: todoImages[index] }));
}

export async function deleteTodo(id) {
  return API.graphql({
    query: deleteTodoMutation,
    variables: { input: { id } },
  });
}

export async function createTodo(todo) {
  return API.graphql({ query: createTodoMutation, variables: { input: todo } });
}

export function getFileName(file) {
  return `${Date.now()}-${file.name || ""}-app`;
}

export async function upload(file, fileName='') {
  return Storage.put(fileName, file);
}
