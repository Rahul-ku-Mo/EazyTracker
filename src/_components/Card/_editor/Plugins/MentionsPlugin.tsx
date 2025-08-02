import type { JSX } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  MenuTextMatch,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { TextNode, $createTextNode } from "lexical";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as ReactDOM from "react-dom";

import { $createMentionNode } from "../MentionNode";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getTeamMembersForMentions, searchTeamMembers } from "../../../../services/teamMembers.service";
  
const PUNCTUATION =
  "\\.,\\+\\*\\?\\$\\@\\|#{}\\(\\)\\^\\-\\[\\]\\\\/!%'\"~=<>_:;";
const NAME = "\\b[A-Z][^\\s" + PUNCTUATION + "]";

const DocumentMentionsRegex = {
  NAME,
  PUNCTUATION,
};

const PUNC = DocumentMentionsRegex.PUNCTUATION;

const TRIGGERS = ["@"].join("");

// Chars we expect to see in a mention (non-space, non-punctuation).
const VALID_CHARS = "[^" + TRIGGERS + PUNC + "\\s]";

// Non-standard series of chars. Each series must be preceded and followed by
// a valid char.
const VALID_JOINS =
  "(?:" +
  "\\.[ |$]|" + // E.g. "r. " in "Mr. Smith"
  " |" + // E.g. " " in "Josh Duck"
  "[" +
  PUNC +
  "]|" + // E.g. "-' in "Salier-Hellendag"
  ")";

const LENGTH_LIMIT = 75;

const AtSignMentionsRegex = new RegExp(
  "(^|\\s|\\()(" +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    VALID_JOINS +
    "){0," +
    LENGTH_LIMIT +
    "})" +
    ")$"
);

// 50 is the longest alias length limit.
const ALIAS_LENGTH_LIMIT = 50;

// Regex used to match alias.
const AtSignMentionsRegexAliasRegex = new RegExp(
  "(^|\\s|\\()(" +
    "[" +
    TRIGGERS +
    "]" +
    "((?:" +
    VALID_CHARS +
    "){0," +
    ALIAS_LENGTH_LIMIT +
    "})" +
    ")$"
);

// Team member interface
interface TeamMember {
  id: string;
  name: string;
  email: string;
  username?: string;
  imageUrl?: string;
  department?: string;
  role?: string;
}

const mentionsCache = new Map<string, TeamMember[]>();

// Real team members lookup service
const teamMembersLookupService = {
  async search(string: string, callback: (results: TeamMember[]) => void): Promise<void> {
    try {
      // Check cache first
      const cachedResults = mentionsCache.get('team-members');
      if (cachedResults) {
        const filteredResults = searchTeamMembers(string, cachedResults);
        callback(filteredResults);
        return;
      }

      // Fetch team members from API
      const teamMembers = await getTeamMembersForMentions();
      
      // Cache the results
      mentionsCache.set('team-members', teamMembers);
      
      // Filter and return results
      const filteredResults = searchTeamMembers(string, teamMembers);
      callback(filteredResults);
    } catch (error) {
      console.error('Error fetching team members for mentions:', error);
      callback([]);
    }
  }
};

function useMentionLookupService(mentionString: string | null) {
  const [results, setResults] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const cachedResults = mentionsCache.get(mentionString || '');

    if (mentionString == null) {
      setResults([]);
      return;
    }

    if (cachedResults !== undefined) {
      setResults(cachedResults);
      return;
    }

    setIsLoading(true);
    teamMembersLookupService.search(mentionString, (newResults) => {
      mentionsCache.set(mentionString, newResults);
      setResults(newResults);
      setIsLoading(false);
    });
  }, [mentionString]);

  return { results, isLoading };
}

function checkForAtSignMentions(
  text: string,
  minMatchLength: number
): MenuTextMatch | null {
  let match = AtSignMentionsRegex.exec(text);

  if (match === null) {
    match = AtSignMentionsRegexAliasRegex.exec(text);
  }
  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];

    const matchingString = match[3];
    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }
  return null;
}

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForAtSignMentions(text, 1);
}

class MentionTypeaheadOption extends MenuOption {
  name: string;
  user: TeamMember;

  constructor(user: TeamMember) {
    super(user.name);
    this.name = user.name;
    this.user = user;
  }
}

function MentionsTypeaheadMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: MentionTypeaheadOption;
}) {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${
        isSelected ? "bg-accent" : ""
      }`}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <Avatar className="size-4">
        <AvatarImage
          src={option.user.imageUrl || "/placeholder.svg"}
          alt={option.user.name}
        />
        <AvatarFallback className="text-[9px] font-semibold">
          {option.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-xs">{option.user.name}</div>
        {option.user.department && (
          <div className="text-xs text-muted-foreground">{option.user.department}</div>
        )}
      </div>
    </li>
  );
}

export default function MentionsPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  const [queryString, setQueryString] = useState<string | null>(null);

  const { results, isLoading } = useMentionLookupService(queryString);

  const checkForSlashTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(
    () =>
      results
        .map((user) => new MentionTypeaheadOption(user))
     ,
    [results]
  );

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        // Create mention with @ symbol for proper display
        const mentionText = `@${selectedOption.user.username || selectedOption.user.name.toLowerCase().replace(/\s+/g, '')}`;
        const mentionNode = $createMentionNode(selectedOption.user.username || selectedOption.user.name.toLowerCase().replace(/\s+/g, ''), mentionText);
        
        if (nodeToReplace) {
          nodeToReplace.replace(mentionNode);
        }
        
        // Add a space after the mention for better UX
        const spaceNode = $createTextNode(' ');
        mentionNode.insertAfter(spaceNode);
        
        // Select the space node so user can continue typing
        spaceNode.select();
        closeMenu();
      });
    },
    [editor]
  );

  const checkForMentionMatch = useCallback(
    (text: string) => {
      const slashMatch = checkForSlashTriggerMatch(text, editor);
      if (slashMatch !== null) {
        return null;
      }
      return getPossibleQueryMatch(text);
    },
    [checkForSlashTriggerMatch, editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) =>
        anchorElementRef.current && (results.length > 0 || isLoading)
          ? ReactDOM.createPortal(
              <div className="fixed z-50 w-48 bg-popover border rounded-md shadow-lg">
                <ul className="max-h-72 overflow-y-auto">
                  {isLoading ? (
                    <li className="px-3 py-2 text-xs text-muted-foreground">
                      Loading team members...
                    </li>
                  ) : results.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-muted-foreground">
                      No team members found
                    </li>
                  ) : (
                    options.map((option, i: number) => (
                      <MentionsTypeaheadMenuItem
                        index={i}
                        isSelected={selectedIndex === i}
                        onClick={() => {
                          setHighlightedIndex(i);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => {
                          setHighlightedIndex(i);
                        }}
                        key={option.key}
                        option={option}
                      />
                    ))
                  )}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null
      }
    />
  );
}
