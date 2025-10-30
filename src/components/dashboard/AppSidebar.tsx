import { useState } from "react";
import { Calendar, BarChart3, Building, Bot, Zap, Settings, HelpCircle, Users, DollarSign, Workflow, Shield } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Visão Geral", url: "/dashboard", icon: BarChart3, tab: "overview" },
  { title: "Meus Negócios", url: "/dashboard", icon: Building, tab: "negocios" },
  { title: "Chatbots", url: "/dashboard", icon: Bot, tab: "chatbots" },
  { title: "Leads/CRM", url: "/dashboard", icon: Users, tab: "crm" },
  { title: "Agendamentos", url: "/dashboard", icon: Calendar, tab: "agendamentos" },
  { title: "Automações", url: "/dashboard", icon: Workflow, tab: "automacoes" },
  { title: "Integrações", url: "/dashboard", icon: Zap, tab: "integracoes" },
  { title: "Segurança", url: "/dashboard", icon: Shield, tab: "security" },
  { title: "Planos", url: "/dashboard", icon: DollarSign, tab: "plan" },
];

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
  };

  const getNavCls = (tab: string) =>
    activeTab === tab 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Automiza</SidebarGroupLabel>
          <SidebarGroupContent>
            <TooltipProvider>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton 
                            onClick={() => handleTabClick(item.tab)}
                            className={getNavCls(item.tab)}
                            aria-label={item.title}
                          >
                            <item.icon className="h-4 w-4" />
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <SidebarMenuButton 
                        onClick={() => handleTabClick(item.tab)}
                        className={getNavCls(item.tab)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}