/**
 * @description       : Provides Object Related Information to the Multiselect Picklist Component.
**/

public with sharing class MultiSelectPicklistComponentController {

    public class PickListInfo {
        @AuraEnabled
        public String label;
        @AuraEnabled
        public String value;

        public PickListInfo(String label, String value) {
            this.label = label;
            this.value = value;
        }
    }

    /**
    * @description  Returns the picklist values of the specified field-name and object's api name.
    * @param objApiName 
    * @param fieldApiName 
    * @return List<Map<String, String>> 
    **/
    @AuraEnabled
    public static List <PickListInfo> getPickListValues(String objApiName, String fieldApiName) {
        List <PickListInfo> options = new List <PickListInfo> ();
        Map < String, Schema.SObjectType > objGlobalMap = Schema.getGlobalDescribe();
        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objApiName);
        if (objType == null) {
            return options;
        }
        Schema.DescribeSObjectResult sobjectDescribe = objType.getDescribe();
        Map < String, Schema.SObjectField > fieldMap = sobjectDescribe.fields.getMap();
        if (fieldMap.get(fieldApiName) == null) {
            return options;
        }
        List < Schema.PicklistEntry > pickListValues = fieldMap.get(fieldApiName).getDescribe().getPickListValues();
        for (Schema.PicklistEntry f: pickListValues) {
            PickListInfo values = new PickListInfo(f.getLabel(), f.getValue());
            options.add(values);
        }
        System.debug(options);
        return options;
    }

    /**
    * @description 
    * @param objApiName 
    * @param fieldApiName 
    * @return String 
    **/
    @AuraEnabled
    public static String getFieldLabel(String objApiName, String fieldApiName) {
        //return FieldUtilityClass.getFieldLabel(objName, fieldName);
        if(objApiName != null && fieldApiName != null){
            return Schema.getGlobalDescribe().get(objApiName).getDescribe().fields.getMap().get(fieldApiName).getDescribe().getLabel();
        }
        return '';
    }
}