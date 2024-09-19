#!/bin/bash

# Prompt the user to enter the log file name
echo "Please enter the log file name (e.g., sync-2024-09-19T04-21-48-084Z.log):"
read LOGFILE

# Check if the file exists
if [ ! -f "$LOGFILE" ]; then
	  echo "Error: File '$LOGFILE' not found!"
	    exit 1
fi

# Calculate processed order count
PROCESSED_ORDER_COUNT=$(grep "upserted" "$LOGFILE" | wc -l)

# Calculate error count
ERROR_COUNT=$(grep "Error" "$LOGFILE" | wc -l)

# Fetch the list of errors if any
if [ "$ERROR_COUNT" -gt 0 ]; then
	  ERROR_LIST=$(grep "Error" "$LOGFILE")
  else
	    ERROR_LIST="No Error found!"
fi

# Display the report
echo "======================================================="
echo "TOTAL ORDERS SYNCED: $PROCESSED_ORDER_COUNT"
echo
echo "TOTAL ERRORS: $ERROR_COUNT"
echo
echo "LIST OF ERRORS:"
echo "$ERROR_LIST"
echo "======================================================="
