import { createClient } from "@/lib/supabase/server";
import MyTodosList, { type MyTodo } from "@/components/todos/MyTodosList";

export const dynamic = "force-dynamic";

export default async function MyTodosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // To-dos assigned to me across all trips I may see. RLS already restricts
  // trip_todos to viewable trips; the assigned_to filter narrows to mine.
  const { data } = await supabase
    .from("trip_todos")
    .select("*, trips(name, cover_color)")
    .eq("assigned_to", user!.id)
    .order("done")
    .order("due_date", { nullsFirst: false })
    .order("created_at");

  const todos: MyTodo[] = (data ?? []).map((t) => ({
    id: t.id,
    trip_id: t.trip_id,
    title: t.title,
    description: t.description,
    due_date: t.due_date,
    done: t.done,
    tripName: t.trips?.name ?? null,
    tripColor: t.trips?.cover_color ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meine Aufgaben</h1>
        <p className="text-sm text-[var(--muted)]">
          Alle ToDos, die dir in deinen Reisen zugewiesen sind.
        </p>
      </div>

      <MyTodosList todos={todos} />
    </div>
  );
}
