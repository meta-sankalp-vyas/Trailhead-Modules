public class TeamMemberController {

    @AuraEnabled(Cacheable=true)
    public static Team_Member__c[] getAllTeamMembers() {
        return [SELECT Id, Name FROM Team_Member__c ORDER BY Id LIMIT 10];
    }
    
    @AuraEnabled(Cacheable=true)
    public static Team_Member__c[] searchTeamMembers(String searchTerm) {
        // Return all team members when no search term
        searchTerm = searchTerm.trim();
        if (searchTerm == '') {
            return getAllTeamMembers();
        }
        // Prepare query paramters
        searchTerm = '%' + searchTerm + '%';
        // Execute search query
        return [SELECT Id, Name, Skills__c, Employee_Id__c FROM Team_Member__c WHERE Name LIKE :searchTerm ORDER BY Id LIMIT 10];
    }
    
    @AuraEnabled(Cacheable=true)
    public static Team_Member__c[] getAllTeamMembersOfATeam(String teamId) {
        if(String.isNotBlank(teamId)){
            return [SELECT Id, Name FROM Team_Member__c WHERE Team__c =:teamId ORDER BY Id];
        }
        return new List<Team_Member__c>();
    }
    
    @AuraEnabled(Cacheable=true)
    public static Team_Member__c[] searchTeamMembersOfATeam(String searchTerm, String teamId) {
        // Return all team members when no search term
        searchTerm = searchTerm.trim();
        if (searchTerm == '') {
            return getAllTeamMembersOfATeam(teamId);
        }
        // Prepare query paramters
        searchTerm = '%' + searchTerm + '%';
        // Execute search query
        if(String.isNotBlank(teamId)){
            return [SELECT Id, Name FROM Team_Member__c WHERE Name LIKE :searchTerm AND Team__c =:teamId ORDER BY Id LIMIT 10];
        }
        return new List<Team_Member__c>();
    }
    
    @AuraEnabled(Cacheable=true)
    public static Team_Member__c getTeamMemberById(String teamMemberId) {
        if(String.isNotBlank(teamMemberId)){
            List<Team_Member__c> listOfTMs = [SELECT Id, Name, Skills__c, Image_Name__c, Employee_Id__c FROM Team_Member__c WHERE Id =:teamMemberId LIMIT 1];
        	System.debug(listOfTMs);
        	return listOfTMs[0];
        }
  		return null;
    }
}