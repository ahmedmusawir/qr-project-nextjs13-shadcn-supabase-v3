"use client";

import React, { useEffect, useState } from "react";
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
import {
  updateTicketStatusById,
  updateTicketsStatusByOrderId,
} from "@/services/ticketServices";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order } from "@/types/orders";

interface Modal {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// UI for Confirmation Modal
const ConfirmationModal = ({ open, onConfirm, onCancel }: Modal) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="bg-white p-5">
        <DialogHeader className="">
          <h3 className="text-lg font-bold text-center">
            Confirm Bulk Validation
          </h3>
          <p className="text-center">You are about to validate all tickets?</p>
        </DialogHeader>
        <DialogTitle>
          <h1 className="text-red-500 text-center">Are you sure?</h1>
        </DialogTitle>
        <DialogFooter className="flex-row justify-center sm:justify-center items-center align-middle space-x-3">
          <Button
            onClick={onCancel}
            variant="secondary"
            className="bg-slate-600 hover:bg-slate-500 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            variant="default"
            className="bg-red-700 hover:bg-red-600 text-white"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface TicketTableProps {
  tickets: Ticket[];
  order: Order;
}

const TicketTable = ({ tickets, order }: TicketTableProps) => {
  // console.log("TICKETS:", tickets);
  // Initialize statuses based on the ticket data
  const [ticketStatuses, setTicketStatuses] = useState<Record<string, string>>(
    {}
  );
  const [isModalOpen, setModalOpen] = useState(false);

  // Populate ticket statuses when the component mounts or when tickets change
  useEffect(() => {
    if (tickets) {
      const initialStatuses = tickets.reduce((acc, ticket) => {
        acc[ticket.ticket_id] = ticket.status; // Initialize statuses based on the ticket data
        return acc;
      }, {} as Record<string, string>);

      // console.log("Ticket Statuses:", initialStatuses);

      setTicketStatuses(initialStatuses); // Set the initial state with ticket statuses
    }
  }, [tickets]); // Re-run this effect if the tickets prop changes

  // Helps validate single Ticket
  const handleValidateTicket = async (ticket_id: string) => {
    try {
      await updateTicketStatusById(ticket_id, "validated");
      // Update the status in the UI
      setTicketStatuses((prev) => ({ ...prev, [ticket_id]: "validated" }));
    } catch (error) {
      console.error("Error validating ticket:", error);
    }
  };

  // Helps validate all Tickets
  const handleValidateAllTickets = async (order_id: string) => {
    try {
      await updateTicketsStatusByOrderId(order_id, "validated");
      setTicketStatuses((prev) => {
        const newStatuses = { ...prev };
        tickets?.forEach((ticket) => {
          newStatuses[ticket.ticket_id] = "validated";
        });
        return newStatuses;
      });
      setModalOpen(false); // Close modal after successful validation
    } catch (error) {
      console.error("Error validating all tickets:", error);
    }
  };

  // Helps reset single Ticket
  const handleResetTicket = async (ticket_id: string) => {
    try {
      await updateTicketStatusById(ticket_id, "live");
      // Update the status in the UI
      setTicketStatuses((prev) => ({ ...prev, [ticket_id]: "live" }));
    } catch (error) {
      console.error("Error resetting ticket:", error);
    }
  };

  return (
    <div className="mt-5">
      <Table className="mb-8">
        <TableCaption>A list of your recent tickets.</TableCaption>
        <TableHeader className="border-b-4 border-red-500">
          <TableRow>
            <TableHead className="font-bold text-sm sm:text-xl">
              Ticket Type
            </TableHead>

            <TableHead className="font-bold text-sm sm:text-xl">
              Ticket Status
            </TableHead>
            <TableHead className="table-cell">
              <Button
                className="bg-slate-600 hover:bg-slate-500 text-white ml-2 float-end"
                onClick={() => setModalOpen(true)}
              >
                Validate All
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets?.map((ticket) => (
            <TableRow
              key={ticket.ticket_id}
              className={`border-b-2 border-slate-400 bg-slate-300 hover:text-slate-700 hover:bg-transparent" ${
                ticketStatuses[ticket.ticket_id] === "validated"
                  ? "bg-slate-700 text-white hover:text-white"
                  : ""
              }`}
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
              <TableCell>{ticketStatuses[ticket.ticket_id]}</TableCell>

              <TableCell className="text-right">
                {ticketStatuses[ticket.ticket_id] === "validated" ? (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white ml-2"
                    onClick={() => handleResetTicket(ticket.ticket_id)}
                  >
                    Reset
                  </Button>
                ) : (
                  <Button
                    className="bg-slate-600 hover:bg-slate-700 text-white ml-2"
                    onClick={() => handleValidateTicket(ticket.ticket_id)}
                  >
                    Validate
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Confirmation Modal for Validate All */}
      <ConfirmationModal
        open={isModalOpen}
        onConfirm={() => handleValidateAllTickets(order.order_id)}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
};

export default TicketTable;
