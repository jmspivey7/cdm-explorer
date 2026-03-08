import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import Home from "./pages/home";
import Sermons from "./pages/sermons";
import Viewer from "./pages/viewer";
import Upload from "./pages/upload";
import Admin from "./pages/admin";
import AdminSermons from "./pages/admin-sermons";
import AdminWorship from "./pages/admin-worship";
import Worship from "./pages/worship";
import WorshipTeacher from "./pages/worship-teacher";
import WorshipChildren from "./pages/worship-children";
import WorshipParents from "./pages/worship-parents";

const SMJ = lazy(() => import("./pages/smj"));
const SMJTeacher = lazy(() => import("./pages/smj-teacher"));
const SMJChildren = lazy(() => import("./pages/smj-children"));
const SMJParents = lazy(() => import("./pages/smj-parents"));
const AdminSMJ = lazy(() => import("./pages/admin-smj"));

function LazyRoute({ component: Component }: { component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-gray-400">Loading...</p></div>}>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sermons" component={Sermons} />
      <Route path="/view/:sermonId" component={Viewer} />
      <Route path="/upload" component={Upload} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/sermons" component={AdminSermons} />
      <Route path="/admin/worship" component={AdminWorship} />
      <Route path="/admin/smj">{() => <LazyRoute component={AdminSMJ} />}</Route>
      <Route path="/worship" component={Worship} />
      <Route path="/worship/teacher" component={WorshipTeacher} />
      <Route path="/worship/children" component={WorshipChildren} />
      <Route path="/worship/parents" component={WorshipParents} />
      <Route path="/smj">{() => <LazyRoute component={SMJ} />}</Route>
      <Route path="/smj/teacher">{() => <LazyRoute component={SMJTeacher} />}</Route>
      <Route path="/smj/children">{() => <LazyRoute component={SMJChildren} />}</Route>
      <Route path="/smj/parents">{() => <LazyRoute component={SMJParents} />}</Route>
      <Route>
        <div className="flex items-center justify-center min-h-screen bg-se-navy">
          <p className="text-lg text-white/60">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
