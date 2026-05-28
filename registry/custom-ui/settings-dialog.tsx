"use client";

import * as React from "react";
import {
  BellIcon,
  ChevronRightIcon,
  PaletteIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";

import {
  Cell,
  CellContent,
  CellDescription,
  CellEnd,
  CellStart,
  CellTitle,
} from "@/components/custom-ui/cell";
import {
  NavigatorDialog,
  useNavigator,
} from "@/components/custom-ui/navigator-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// A worked example of NavigatorDialog + Cell: a drill-in settings dialog.
// Copy it in and adapt the views to your own settings — the data below is
// placeholder content.

interface SettingsRow {
  /** Matches a NavigatorView id below — `navigate()` drills into it. */
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const SETTINGS_ROWS: SettingsRow[] = [
  {
    id: "edit-name",
    icon: <UserIcon />,
    title: "Edit name",
    description: "Change your display name",
  },
  {
    id: "notifications",
    icon: <BellIcon />,
    title: "Notifications",
    description: "Manage notification preferences",
  },
  {
    id: "appearance",
    icon: <PaletteIcon />,
    title: "Appearance",
    description: "Customize your experience",
  },
  {
    id: "advanced",
    icon: <ShieldIcon />,
    title: "Advanced",
    description: "Developer options and more",
  },
];

// Menu view — a Cell-based list. Each row is a button that drills in.
function MenuView() {
  const { navigate } = useNavigator();
  return (
    <div className="flex flex-col gap-2">
      {SETTINGS_ROWS.map((row) => (
        <Cell key={row.id} asChild variant="outline">
          <button type="button" onClick={() => navigate(row.id)}>
            <CellStart>
              <span className="bg-muted text-foreground flex size-9 items-center justify-center rounded-full [&_svg]:size-4">
                {row.icon}
              </span>
            </CellStart>
            <CellContent>
              <CellTitle>{row.title}</CellTitle>
              <CellDescription>{row.description}</CellDescription>
            </CellContent>
            <CellEnd>
              <ChevronRightIcon className="text-muted-foreground size-4" />
            </CellEnd>
          </button>
        </Cell>
      ))}
    </div>
  );
}

// A drilled-in editing view — no redundant heading; the screen title
// already names it in the header bar.
function EditNameView() {
  const { back } = useNavigator();
  return (
    <form
      id="settings-display-name-form"
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        back();
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="settings-display-name">Display name</Label>
        <Input id="settings-display-name" defaultValue="Ada Lovelace" />
      </div>
    </form>
  );
}

function PlaceholderView({ text }: { text: string }) {
  return <p className="text-muted-foreground text-sm">{text}</p>;
}

export interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  return (
    <NavigatorDialog
      open={open}
      onOpenChange={onOpenChange}
      initialView="menu"
      views={[
        {
          id: "menu",
          name: "Settings",
          title: "Account",
          description: "Manage your account and preferences.",
          render: () => <MenuView />,
        },
        {
          id: "edit-name",
          name: "Profile",
          title: "Edit name",
          render: () => <EditNameView />,
          footer: () => (
            <Button form="settings-display-name-form" type="submit">
              Save
            </Button>
          ),
        },
        {
          id: "notifications",
          name: "Notifications",
          title: "Notifications",
          render: () => (
            <PlaceholderView text="Notification preferences would go here." />
          ),
        },
        {
          id: "appearance",
          name: "Appearance",
          title: "Appearance",
          render: () => (
            <PlaceholderView text="Appearance settings would go here." />
          ),
        },
        {
          id: "advanced",
          name: "Advanced",
          title: "Advanced",
          render: () => (
            <PlaceholderView text="Advanced and developer options would go here." />
          ),
        },
      ]}
    />
  );
}
