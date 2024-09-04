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
        <TableHeader className="border-b-2 border-red-400">
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
            <TableRow
              key={ticket.ticket_id}
              className="border-b-2 border-slate-400"
            >
              <TableCell>
                {ticket.ticket_type}
                <Badge
                  variant={"outline"}
                  className="hidden sm:inline ml-5 p-[.5rem] bg-red-700 text-white "
                >
                  ID: {ticket.ticket_id}{" "}
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
