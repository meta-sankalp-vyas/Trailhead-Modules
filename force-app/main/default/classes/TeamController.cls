public class TeamController {
	
    @AuraEnabled(Cacheable=true)
    public static Team__c[] getAllTeams() {
        return [SELECT Id, Name, Description__c, Manager_Name__c, Rating__c FROM Team__c ORDER BY Id LIMIT 10];
    }
    
    @AuraEnabled(Cacheable=true)
    public static Team__c[] searchTeams(String searchTerm) {
        // Return all teams when no search term
        searchTerm = searchTerm.trim();
        if (searchTerm == '') {
            return getAllTeams();
        }
        // Prepare query paramters
        searchTerm = '%' + searchTerm + '%';
        // Execute search query
        return [SELECT Id, Name, Description__c, Manager_Name__c, Rating__c FROM Team__c WHERE Name LIKE :searchTerm ORDER BY Id LIMIT 10];
    }
    
    @AuraEnabled(Cacheable=true)
    public static Team__c getTeamById(String teamId) {
        // Execute search query
        return [SELECT Id, Name, Description__c, Manager_Name__c, Rating__c FROM Team__c WHERE Id =:teamId];
    }

}