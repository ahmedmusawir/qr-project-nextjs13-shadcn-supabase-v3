"use client";

import React, { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import Link from "next/link";
import { formatDate } from "@/utils/common/commonUtils";
import { Badge } from "../ui/badge";
import { Ticket } from "@/types/tickets";

interface TicketTableProps {
  tickets?: Ticket[];
}

const TicketTable = ({ tickets }: TicketTableProps) => {
  return (
    <div className="mt-10">
      <Table className="mb-8">
        <TableCaption>A list of your recent JSON Server tickets.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Ticket Type</TableHead>
            <TableHead className="hidden md:table-cell">
              Ticket Status
            </TableHead>
            <TableHead className="hidden md:table-cell">Button</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets?.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                {ticket.ticket_type}
                <Badge variant={"outline"} className="ml-5">
                  ID: {ticket.order_id}{" "}
                </Badge>
              </TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell className="text-right">
                <Button className="bg-red-400 text-white ml-2">Confirm</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketTable;
