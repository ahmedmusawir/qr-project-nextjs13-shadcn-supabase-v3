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
import { Ticket } from "@/types/tickets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TicketTableProps {
  tickets?: Ticket[];
}

const TicketTable = ({ tickets }: TicketTableProps) => {
  return (
    <div className="mt-10">
      <Table className="mb-8">
        <TableCaption>A list of your recent tickets.</TableCaption>
        <TableHeader className="border-b-2 border-red-400">
          <TableRow>
            <TableHead className="">Ticket Type</TableHead>

            <TableHead className="table-cell">Ticket Status</TableHead>
            <TableHead className="table-cell">
              {/* <Button className="bg-slate-600 hover:bg-slate-500 text-white ml-2 float-end">
                Reset All
              </Button> */}
              <Button className="bg-slate-600 hover:bg-slate-500 text-white ml-2 float-end">
                Validate All
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets?.map((ticket) => (
            <TableRow
              key={ticket.ticket_id}
              className="border-b-2 border-slate-400"
              // className="border-b-2 border-slate-400 bg-slate-400"
            >
              <TableCell>
                {ticket.ticket_type}
                <Badge
                  variant={"outline"}
                  className="hidden md:inline ml-5 p-[.5rem] bg-red-700 text-white "
                >
                  ID: {ticket.ticket_id}{" "}
                </Badge>
              </TableCell>
              <TableCell>{ticket.status}</TableCell>
              <TableCell className="text-right">
                {/* <Button className="bg-slate-600 hover:bg-slate-500 text-white ml-2">
                  Reset
                </Button> */}
                <Button className="bg-slate-600 hover:bg-slate-500 text-white ml-2">
                  Validate
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TicketTable;
