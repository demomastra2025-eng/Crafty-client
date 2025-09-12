"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MoreHorizontal, Edit, Link, Trash2, Clock, IdCard, User, Mail, Phone } from "lucide-react";
import PaymentsTable from "./payments";

import customerData from "../data/customer.json";
import payments from "../data/payments.json";

export default function CustomerDetail2() {
  const [activeTab, setActiveTab] = useState("payments");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-foreground text-2xl font-semibold">{customerData.name}</h1>
        <div className="flex items-center gap-2">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Send invoice
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit information
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Link to vendor
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column - Customer Details */}
        <div className="space-y-4 lg:col-span-4">
          {/* Customer Details Card */}
          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 text-lg font-medium">
                Customer details
                <Edit className="text-muted-foreground h-4 w-4" />
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Customer since</div>
                  <div className="font-medium">{customerData.customerSince}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2">
                  <IdCard className="text-muted-foreground h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Customer ID</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{customerData.customerId}</span>
                    <div className="bg-success h-2 w-2 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2">
                  <User className="text-muted-foreground h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Customer type</div>
                  <div className="font-medium">{customerData.customerType}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Email address</div>
                  <div className="font-medium">{customerData.email}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-muted rounded-full p-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">Mobile number</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{customerData.phone}</span>
                    <Badge variant="outline" className="h-5 px-2 py-0 text-xs">
                      {customerData.country}
                    </Badge>
                    <div className="bg-success h-3 w-4 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Address</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
                  BILLING ADDRESS
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{customerData.billingAddress.street}</div>
                  <div className="font-medium">{customerData.billingAddress.country}</div>
                  <div className="text-muted-foreground">{customerData.billingAddress.phone}</div>
                </div>
              </div>

              <div>
                <div className="text-muted-foreground mb-2 text-sm font-medium tracking-wider uppercase">
                  SHIPPING DETAILS
                </div>
                <div className="space-y-1">
                  <div className="font-medium">{customerData.shippingAddress.street}</div>
                  <div className="font-medium">{customerData.shippingAddress.country}</div>
                  <div className="text-muted-foreground">{customerData.shippingAddress.phone}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payments */}
        <div className="lg:col-span-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="payments" className="relative">
                Payments
                {activeTab === "payments" && (
                  <div className="bg-success absolute right-0 bottom-0 left-0 h-0.5 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>

            <TabsContent value="payments" className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card>
                  <CardContent>
                    <div className="text-2xl font-semibold">
                      {customerData.paymentsSummary.totalPayments}
                    </div>
                    <div className="text-muted-foreground text-sm tracking-wider uppercase">
                      TOTAL PAYMENTS
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="text-2xl font-semibold">
                      ${customerData.paymentsSummary.totalAmount}
                    </div>
                    <div className="text-muted-foreground text-sm tracking-wider uppercase">
                      TOTAL AMOUNT PAID
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payments Table */}
              <PaymentsTable data={payments} />
            </TabsContent>

            <TabsContent value="invoices">
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Invoices content would go here</p>
              </div>
            </TabsContent>

            <TabsContent value="account">
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Account content would go here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
