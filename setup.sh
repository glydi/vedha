#!/bin/bash

# setup.sh - Interactively configure Render and Spring Boot properties

echo "====================================================="
echo "  Render Configuration Setup Script for Vedha"
echo "====================================================="
echo "This script will help you configure your database"
echo "credentials across render.yaml and properties files."
echo "Press ENTER to keep the current value shown in brackets."
echo ""

# Helper function to prompt and read
prompt() {
    local prompt_text=$1
    local var_name=$2
    local current_val=$3
    
    read -p "$prompt_text [$current_val]: " input
    if [ -z "$input" ]; then
        eval $var_name=\"$current_val\"
    else
        eval $var_name=\"$input\"
    fi
}

# Current defaults (from properties or hardcoded)
CUR_JDBC="jdbc:postgresql://npvwzgnwprxt.db.dbaas.dev:30731/PwKFWx"
CUR_USER="pGYRXxF"
CUR_PASS="ZGGAzvC"
CUR_JWT="this-is-a-very-secure-static-secret-key-for-vedha-01"
CUR_CORS="*"

echo "--- 1. Database Configuration ---"
prompt "JDBC Database URL" NEW_JDBC "$CUR_JDBC"
prompt "Database Username" NEW_USER "$CUR_USER"
prompt "Database Password" NEW_PASS "$CUR_PASS"

echo ""
echo "--- 2. Security & Environment ---"
prompt "JWT Secret Key" NEW_JWT "$CUR_JWT"
prompt "CORS Allowed Origins (e.g. https://your-frontend.onrender.com or *)" NEW_CORS "$CUR_CORS"

echo ""
echo "Updating configuration files..."

# Update application-render.properties
PROPS_FILE="backend/src/main/resources/application-render.properties"
if [ -f "$PROPS_FILE" ]; then
    sed -i "s|^spring.datasource.url=.*|spring.datasource.url=\${SPRING_DATASOURCE_URL:$NEW_JDBC}|" $PROPS_FILE
    sed -i "s|^spring.datasource.username=.*|spring.datasource.username=\${SPRING_DATASOURCE_USERNAME:$NEW_USER}|" $PROPS_FILE
    sed -i "s|^spring.datasource.password=.*|spring.datasource.password=\${SPRING_DATASOURCE_PASSWORD:$NEW_PASS}|" $PROPS_FILE
    sed -i "s|^vedha.jwt.secret=.*|vedha.jwt.secret=\${JWT_SECRET:$NEW_JWT}|" $PROPS_FILE
    sed -i "s|^vedha.cors.allowed-origins=.*|vedha.cors.allowed-origins=\${CORS_ALLOWED_ORIGINS:$NEW_CORS}|" $PROPS_FILE
    echo "✅ Updated $PROPS_FILE"
else
    echo "❌ Could not find $PROPS_FILE"
fi

# Update application.properties
APP_FILE="backend/src/main/resources/application.properties"
if [ -f "$APP_FILE" ]; then
    sed -i "s|^spring.datasource.url=.*|spring.datasource.url=$NEW_JDBC|" $APP_FILE
    sed -i "s|^spring.datasource.username=.*|spring.datasource.username=$NEW_USER|" $APP_FILE
    sed -i "s|^spring.datasource.password=.*|spring.datasource.password=$NEW_PASS|" $APP_FILE
    echo "✅ Updated $APP_FILE"
else
    echo "❌ Could not find $APP_FILE"
fi

# Update render.yaml
RENDER_FILE="render.yaml"
if [ -f "$RENDER_FILE" ]; then
    # We use awk or perl to reliably replace the lines after specific keys in yaml, 
    # but since it's a bit rigid, here's a relatively safe sed approach based on our known structure:
    # This specifically replaces the exact values we know. Note: If values change out of band, sed might miss.
    sed -i "s|value: $CUR_JDBC|value: $NEW_JDBC|" $RENDER_FILE
    sed -i "s|value: $CUR_USER|value: $NEW_USER|" $RENDER_FILE
    sed -i "s|value: $CUR_PASS|value: $NEW_PASS|" $RENDER_FILE
    sed -i "s|value: $CUR_CORS|value: $NEW_CORS|" $RENDER_FILE
    echo "✅ Updated $RENDER_FILE"
else
    echo "❌ Could not find $RENDER_FILE"
fi

echo ""
echo "====================================================="
echo "Setup complete! Your configurations are updated."
echo "You can now commit these changes and push to Render."
echo "====================================================="
