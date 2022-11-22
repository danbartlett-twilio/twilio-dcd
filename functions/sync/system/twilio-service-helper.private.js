/*

  twilio-service-helper.private.js

  Helper functions to get environment details

*/

exports.getCurrentEnvironment = async (client, DOMAIN_NAME) => {

    console.log(`in getCurrentEnvironment...)`);
    
    if (DOMAIN_NAME && DOMAIN_NAME.startsWith("localhost")) {
        return;
    }

    const services = await client.serverless.services.list();
    for (let service of services) {
        console.log("Searching for environment. Looping through service: " + service.sid);
        const environments = await client.serverless
        .services(service.sid)
        .environments.list();
        const environment = environments.find(
        env => env.domainName === DOMAIN_NAME
        );
        if (environment) {
        // Exit the function
        console.log("Environment is ==> ", environment);
        return environment;
        }
    }
}

exports.getTargetVariable = async (client, environment, targetKey) => {
    
    console.log(`in getTargetVariable...)`);

    const variables = await client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();        
    
    return variables.find(variable => variable.key === targetKey);
}

exports.updateEnvironmentVariable = async (client, environment, targetVariable, key, value) => {
    try {
      if (!environment) {
        throw new Error('No Env!')
      }
      console.log(`Updating variable ${key} (in twilio-service-helper)`);
      await client.serverless
        .services(environment.serviceSid)
        .environments(environment.sid)
        .variables(targetVariable.sid)
        .update({
          key: key,
          value: value
        });

    } catch (err) {
      console.error(`Error creating '${key}' with '${value}': ${err}`);
      return false;
    }
    return true;
}

exports.getAllVariables = async (client, environment) => {

    const variables = await client.serverless
    .services(environment.serviceSid)
    .environments(environment.sid)
    .variables.list();        
    
    console.log("variables ==> ", variables);

    return variables;
}

exports.getLastBuild = async (client, environment) => {

    const builds = await client.serverless
    .services(environment.serviceSid)
    .builds.list();        
    
    console.log("builds ==> ", builds);

    return builds[0];
}