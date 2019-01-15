import { HomeComponent } from "./components/home/home.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SettingsComponent } from "./components/settings/settings.component";
import { DebugComponent } from "./components/debug/debug.component";

const routes: Routes = [
  {
    path: "",
    component: HomeComponent
  },
  {
    path: "settings",
    component: SettingsComponent
  },
  {
    path: "debug",
    component: DebugComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
