// Digital Boarding React layouts
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
import Registration from "layouts/registration";
import Eventsreports from "layouts/eventsreports";
import Financereports from "layouts/financereports";
import Works from "layouts/works";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ImageIcon from "@mui/icons-material/Image";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import CategoryIcon from "@mui/icons-material/Category";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import StyleIcon from "@mui/icons-material/Style";
import Categories from "layouts/categories";
import Departments from "layouts/departments";
import Addevents from "layouts/addevents";
import EventRegistration from "layouts/eventregistration";
import HomeBanners from "layouts/homebanners/homeBanners";
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
