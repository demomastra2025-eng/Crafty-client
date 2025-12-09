import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function NewCustomer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <UserPlus />
          Новый клиент
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Добавить клиента</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Имя</Label>
            <Input id="name" placeholder="Введите имя клиента" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" placeholder="+7 (___) ___-__-__" />
          </div>
          <Button className="w-full">Сохранить</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
