FROM postgres:16-alpine
COPY init.sql /init.sql
CMD ["sh", "-c", "psql \"$DATABASE_URL\" -f /init.sql"]
