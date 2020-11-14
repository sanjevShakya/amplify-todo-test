import { API } from "aws-amplify";
import { listTodos } from "../graphql/queries";
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation,
} from "../graphql/mutations";

export async function fetchTodos() {
  const apiData = await API.graphql({ query: listTodos });
  console.log('this function called')
  return apiData.data.listTodos.items;
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
