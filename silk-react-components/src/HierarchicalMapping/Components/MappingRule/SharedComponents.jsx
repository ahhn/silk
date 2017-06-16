import React from 'react';
import _ from 'lodash';
import {Icon} from 'ecc-gui-elements';

export const RuleTitle = ({rule}) => {

    switch (rule.type) {
    case 'root':
        const title = _.get(rule, 'rules.typeRules[0].typeUri', '(no target type)');
        return (<span>{_.isEmpty(title) ? '[no type]' : title}</span>);
    case 'direct':
    case 'object':
        return (<span>{_.get(rule, 'mappingTarget.uri', '(no target property)')}</span>);
    case 'complex':
        //TODO: Complex Mappings need better titles
        return 'Complex Mapping';
        return <span>Complex Mapping</span>
    }

};

const ntt = '(no target type)';

export const RuleTypes = ({rule}) => {

    switch (rule.type) {
    case 'object':
        let types = _.get(rule, 'rules.typeRules', []).map(({typeUri}) => typeUri);
        types = _.isEmpty(types) ? ntt : types.join(', ');
        return <span>{types}</span>;
    case 'direct':
    case 'complex':
        return <span>{_.get(rule, 'mappingTarget.valueType.nodeType', ntt)}</span>;
    case 'root':
        return <span/>;
    }

};

export const SourcePath = ({rule}) => {
    const path = _.get(rule, 'sourcePath', '(no source path)');

    return <span>{_.isArray(path) ? path.join(', ') : path}</span>;

};

export const RuleTreeTitle = ({rule}) => {
    const childCount = _.get(rule, 'rules.propertyRules', []).length;
    switch (rule.type) {
        case 'root':
            const title = _.get(rule, 'rules.typeRules[0].typeUri', '(no target type)');
            return (<span>{_.isEmpty(title) ? '[no type]' : title} ({childCount})</span>);
        case 'object':
            return (<span>{_.get(rule, 'mappingTarget.uri', '(no target property)')} ({childCount})</span>);
        default:
            return false;
    }

};

export const RuleTreeTypes = ({rule}) => {

    switch (rule.type) {
        case 'object':
            let types = _.get(rule, 'rules.typeRules', []).map(({typeUri}) => typeUri);
            types = _.isEmpty(types) ? '(no target type)' : types.join(', ');
            return <span>{types}</span>;
        case 'root':
        default:
            return false;
    }

};

export const ThingClassName = ({id, name}) => {
    return <span>{name ? name : 'super entity'}</span>
};

export const ThingName = ({id}) => {
    return <span>{id} (TODO: readable name)</span>
}

export const ThingDescription = ({id}) => {
    return <p>TODO: Include vocabulary description about {id}</p>
}

export const ThingIcon = ({type, tooltip, status, message}) => {
    let iconName = 'help_outline';
    switch(type) {
        case 'direct':
        case 'complex':
            iconName = "insert_drive_file";
            break;
        case 'object':
            iconName = "folder";
            break;
        default:
            iconName = 'help_outline';
    }

    return <Icon
        className='ecc-silk-mapping__ruleitem-icon'
        name={status === 'error' ? 'warning' : iconName}
        tooltip={status === 'error' ? tooltip + ' (' + message + ')' : tooltip}
    />
}