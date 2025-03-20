import React from "react";
import { SidebarProvider} from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSideBar";
import AppHeader from "./components/AppHeader";


function App() {
  return (
    <SidebarProvider>
		
      <AppSidebar />
      <main>
	  	<AppHeader />	
       
      </main>
    </SidebarProvider>
  );
}

export default App;
