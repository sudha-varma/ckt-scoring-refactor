#!/bin/bash
defaultHookPath=".git/hooks"
projectHookPath="bin/hooks"
if [ -d ${projectHookPath} -a -d ${defaultHookPath} ]
then
  echo "Hook directory exists"
  echo "Symlinking git hook"
  for file in `ls ${projectHookPath}`;
    do ln -sf "../../${projectHookPath}/${file}" "${defaultHookPath}/${file}";
    echo "Removing sample hooks"
    rm -f "${defaultHookPath}/${file}.sample";
  done;
  # git config core.hooksPath ${projectHookPath};
else
    echo "Hook directory not present"
fi
