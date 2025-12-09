import { IconDashboard, IconListDetails, IconRobot, IconUsers, IconHome, IconBrandWhatsapp } from "@tabler/icons-react";
import { KanbanIcon } from "lucide-react";

export const sidebarData = {
  user: {
    name: "Ахан",
    email: "bakhitov.akhan@gmail.com",
    avatar: "/logo.png"
  },
  navMain: [
    {
      title: "Главное",
      items: [
        {
          title: "CRM",
          url: "/crm",
          icon: IconDashboard,
        },
        {
          title: "Чаты",
          url: "/chats",
          icon: IconUsers
        },
        {
          title: "Канбан",
          url: "/kanban-board",
          icon: KanbanIcon
        },
        {
          title: "Недвижимость",
          url: "/real-estate-listings",
          icon: IconHome
        },
        {
          title: "Клиенты",
          url: "/customers",
          icon: IconListDetails,
        },
        {
          title: "AI-чат",
          url: "/ai-chat",
          icon: IconRobot
        },
        {
          title: "Коннекты",
          url: "/connections",
          icon: IconBrandWhatsapp
        },
      ]
    }
  ]
};

export type SidebarNavMain = (typeof sidebarData.navMain)[number];
export type SidebarNavMainItem = (typeof sidebarData.navMain)[0]["items"][number];
