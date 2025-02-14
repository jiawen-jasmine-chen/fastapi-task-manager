export type RootStackParamList = {
  Home: undefined;
  TaskDetail: { task: { 
    id: number;
    description: string; 
    progress?: string; 
    assignee?: number | null; 
    due_date?: string | null; 
    created_at?: string;
    todolist_id: number; 
    owner_id: number; 
    completed: boolean;
  }};
  Register: undefined;
};

