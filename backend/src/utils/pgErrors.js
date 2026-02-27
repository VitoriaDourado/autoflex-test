/**
 * Centralized PostgreSQL error handler.
 * Maps PG error codes to HTTP status + user-friendly messages.
 */

const PG_UNIQUE     = '23505'; // duplicate key / unique constraint
const PG_FK         = '23503'; // foreign key violation
const PG_CHECK      = '23514'; // check constraint violation
const PG_NOT_NULL   = '23502'; // not-null constraint violation
const PG_INVALID    = '22P02'; // invalid input syntax (e.g. non-numeric id)

function uniqueMessage(err) {
  const constraint = err.constraint || '';
  if (constraint.includes('code')) return "This code is already in use. Please choose a different one.";
  return "A record with this value already exists.";
}

function foreignKeyMessage(err) {
  const detail = err.detail || '';
  if (detail.includes('is not present in table')) return "Referenced record does not exist.";
  if (detail.includes('still referenced from table')) return "Cannot delete: this record is being used by other records.";
  return "Foreign key constraint violation.";
}

function checkMessage(err) {
  const constraint = err.constraint || '';
  if (constraint.includes('stock_quantity')) return "Stock quantity cannot be negative.";
  if (constraint.includes('price'))          return "Price cannot be negative.";
  if (constraint.includes('quantity_required')) return "Required quantity must be greater than zero.";
  return "Value does not meet the required constraints.";
}

function handlePgError(error, res) {
  switch (error.code) {
    case PG_UNIQUE:
      return res.status(409).json({ error: uniqueMessage(error) });

    case PG_FK:
      return res.status(422).json({ error: foreignKeyMessage(error) });

    case PG_CHECK:
      return res.status(400).json({ error: checkMessage(error) });

    case PG_NOT_NULL:
      return res.status(400).json({
        error: `Field '${error.column}' cannot be empty.`,
      });

    case PG_INVALID:
      return res.status(400).json({ error: "Invalid value format." });

    default:
      console.error('[DB Error]', error);
      return res.status(500).json({ error: "Internal server error." });
  }
}

module.exports = { handlePgError };
