import { Context, Router } from "https://deno.land/x/oak@v12.4.0/mod.ts";

const router = new Router();
interface Todo {
    id: string;
    text: string;
}

let todos: Todo[] = [];

router.get("/todos", (ctx: Context) => {
    ctx.response.body = { todos: todos };
});

router.post("/todos", async (ctx: Context) => {
    const body = ctx.request.body();
    const data = await body.value;
    const newTodo: Todo = { id: new Date().toISOString(), text: data.text };
    todos.push(newTodo);
    ctx.response.status = 201;
    ctx.response.body = { message: "Created todo!", todo: newTodo };
});

router.put("/todos/:todoId", async (ctx: Context) => {
    const tid = ctx.params.todoId;
    const body = ctx.request.body();
    const data = await body.value;
    const todoIndex = todos.findIndex(todo => todo.id === tid);
    todos[todoIndex] = { id: todos[todoIndex].id, text: data.text };
    ctx.response.status = 200;
    ctx.response.body = { message: "Updated todo!" };
});

router.delete("/todos/:todoId", (ctx: Context) => {
    const tid = ctx.params.todoId;
    todos = todos.filter(todo => todo.id !== tid);
    ctx.response.status = 200;
    ctx.response.body = { message: "Deleted todo!" };
});

export default router;
