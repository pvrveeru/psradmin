// Digital Boarding React layouts
import SignIn from "layouts/authentication/sign-in";
import Works from "layouts/works";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";

import Categories from "layouts/categories";
import Users from "layouts/users";
// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // {
  //   type: "collapse",
  //   name: "Dashboard",
  //   key: "dashboard",
  //   icon: <AssessmentIcon sx={{ fontSize: "30px !important" }} />,
  //   route: "/dashboard",
  //   component: <Dashboard />,
  // },
  {
    type: "collapse",
    name: "Work Report",
    key: "works",
    icon: <LocalActivityIcon sx={{ fontSize: "30px !important" }} />,
    route: "/works",
    component: <Works />,
  },
  {
    type: "collapse",
    name: "Users",
    key: "users",
    icon: <VerifiedUserIcon sx={{ fontSize: "30px !important" }} />,
    route: "/users",
    component: <Users />,
  },
  {
    type: "collapse",
    name: "Assigned By",
    key: "categories",
    icon: <SwitchAccountIcon sx={{ fontSize: "30px !important" }} />,
    route: "/categories",
    component: <Categories />,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
