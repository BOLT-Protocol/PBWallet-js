echo "[pre-commit] Start pre-commit check"

# Eslint check all files
npm test
if [[ "$?" == 1 ]]; then
    echo "ESlint check fail, abort git push"
    exit 1
fi
echo "Pass for Eslint check"
echo "[pre-commit] successfully"