import { createContext, useContext, useState, ReactNode } from "react";

// 1. Define the shape of our context
type ModelContextType = {
  activeModel: string;
  setActiveModel: (model: string) => void;
};

// 2. Create the context
const ModelContext = createContext<ModelContextType | undefined>(undefined);

// 3. Create a Provider component that will wrap your app
export function ModelProvider({ children }: { children: ReactNode }) {
  const [activeModel, setActiveModel] = useState<string>("no model selected");

  return (
    <ModelContext.Provider value={{ activeModel, setActiveModel }}>
      {children}
    </ModelContext.Provider>
  );
}

// 4. Create a custom hook so it's easy to use in other files
export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
